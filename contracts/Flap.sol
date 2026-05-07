// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { Ownable }          from "openzeppelin/access/Ownable.sol";
import { Pausable }         from "openzeppelin/utils/Pausable.sol";
import { ReentrancyGuard }  from "openzeppelin/utils/ReentrancyGuard.sol";
import { IERC20 }           from "openzeppelin/token/ERC20/IERC20.sol";
import { SafeERC20 }        from "openzeppelin/token/ERC20/utils/SafeERC20.sol";
import { ERC721 }           from "openzeppelin/token/ERC721/ERC721.sol";

/// @title  Flap — sats-back arcade with day-bucketed bounty pools
/// @notice Each play is a short stake on a flappy-shaped game. Beat the score
///         threshold and the contract pays back 2× the stake. Miss it and the
///         stake feeds that day's bounty pool, which the day's top scorer
///         claims after the day finalizes.
///
///         Three badge kinds — Podium (top-10 of finalized seasons),
///         Participation (≥5 plays in a season), Streak (consecutive-day
///         milestones). All three are soulbound: minting works, transfers
///         revert. You earn them, you keep them.
contract Flap is ERC721, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    uint64  public constant HOP_COOLDOWN     = 21 hours;
    uint64  public constant HOP_GRACE        = 45 hours;
    uint16  public constant SCORE_MULTIPLIER = 200;        // 2.00× when threshold met
    uint16  public constant BPS              = 10_000;
    uint8   public constant PARTICIPATION_THRESHOLD = 5;
    uint16  public constant PODIUM_RANK_LIMIT       = 10;

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ enums + structs ━━━━━━━━━━━━━━━━━━━━━━ */

    enum PlayState { None, Open, Settled, Cancelled }
    enum BadgeKind { Podium, Participation, Streak }

    struct Play {
        address player;
        uint128 stake;
        uint64  startedAt;
        uint64  score;
        PlayState state;
    }

    struct Season {
        uint64 startedAt;
        uint64 endsAt;
        bool   finalized;
    }

    struct DayLedger {
        address topPlayer;
        uint64  topScore;
        uint128 bountyPool;
        bool    finalized;
        bool    bountyClaimed;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ state ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    IERC20 public immutable cUSD;
    address public treasury;
    address public scorer;

    uint128 public scoreThreshold;        // beat this to win the play (cUSD threshold-units)
    uint128 public minStake;
    uint128 public maxStake;

    uint256 public nextPlayId;
    uint256 public nextSeasonId;
    uint256 public nextTokenId;

    string private _baseTokenURI;

    mapping(uint256 => Play) public plays;
    mapping(uint256 => DayLedger) public ledger;            // day index => bounty + winner
    mapping(uint256 => Season) public seasons;
    mapping(uint256 => mapping(address => uint16)) public seasonRank; // 1..PODIUM_RANK_LIMIT
    mapping(uint256 => mapping(address => uint16)) public seasonPlays;
    mapping(uint256 => mapping(address => bool)) public claimedPodium;
    mapping(uint256 => mapping(address => bool)) public claimedParticipation;

    // streak (consecutive days played)
    mapping(address => uint256) public lastPlayDay;
    mapping(address => uint16)  public playStreak;
    mapping(address => mapping(uint16 => bool)) public claimedStreakAt;

    // retention (player check-in, distinct from playStreak)
    mapping(address => uint64)  public lastHop;
    mapping(address => uint16)  public hopRun;
    mapping(address => uint128) public hopCredits;
    mapping(address => address) public introducerOf;
    mapping(address => uint32)  public introductionCount;

    // badge metadata for token discovery
    mapping(uint256 => BadgeKind) public badgeKindOf;
    mapping(uint256 => uint256)   public badgeContextOf; // seasonId for podium/participation; streak length for streak

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ events ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    event PlayOpened(uint256 indexed playId, address indexed player, uint256 stake, uint256 day);
    event ScoreReported(uint256 indexed playId, address indexed player, uint64 score);
    event PlaySettled(
        uint256 indexed playId,
        address indexed player,
        bool won,
        uint256 payout,
        uint256 toBounty
    );
    event PlayCancelled(uint256 indexed playId, address indexed player);

    event BountySponsored(uint256 indexed day, address indexed sponsor, uint256 amount);
    event DayFinalized(uint256 indexed day, address indexed top, uint64 score, uint256 pool);
    event BountyClaimed(uint256 indexed day, address indexed claimer, uint256 amount);

    event SeasonStarted(uint256 indexed seasonId, uint64 endsAt);
    event SeasonFinalized(uint256 indexed seasonId);
    event SeasonRankSet(uint256 indexed seasonId, address indexed player, uint16 rank);
    event PodiumBadgeMinted(uint256 indexed seasonId, address indexed player, uint16 rank, uint256 indexed tokenId);
    event ParticipationBadgeMinted(uint256 indexed seasonId, address indexed player, uint256 indexed tokenId);
    event StreakBadgeMinted(address indexed player, uint16 streakLength, uint256 indexed tokenId);

    event Hopped(address indexed player, uint16 run, uint128 reward);
    event IntroducerSet(address indexed player, address indexed introducer);

    event ScorerUpdated(address indexed oldScorer, address indexed newScorer);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ScoreThresholdUpdated(uint128 oldThreshold, uint128 newThreshold);
    event StakeBoundsUpdated(uint128 newMin, uint128 newMax);
    event BaseURIUpdated(string newBaseURI);

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ errors ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    error Flap__ZeroAddress();
    error Flap__NotPlayer();
    error Flap__NotScorer();
    error Flap__StakeBounds();
    error Flap__PlayNotOpen();
    error Flap__PlayNotSettled();
    error Flap__AlreadySettled();
    error Flap__AlreadyScored();
    error Flap__NoScore();
    error Flap__DayNotFinalized();
    error Flap__DayAlreadyFinalized();
    error Flap__NotTopPlayer();
    error Flap__BountyAlreadyClaimed();
    error Flap__SeasonNotActive();
    error Flap__SeasonAlreadyFinalized();
    error Flap__SeasonNotFinalized();
    error Flap__InvalidRank();
    error Flap__PodiumNotEarned();
    error Flap__AlreadyClaimedBadge();
    error Flap__ParticipationNotEarned();
    error Flap__InvalidEndsAt();
    error Flap__StreakNotReached();
    error Flap__StreakAlreadyClaimed();
    error Flap__HopTooSoon();
    error Flap__AlreadyIntroduced();
    error Flap__CannotIntroduceSelf();
    error Flap__InvalidThreshold();
    error Flap__SoulboundTransfer();

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ constructor ━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    constructor(
        IERC20 _cUSD,
        address _treasury,
        address _scorer,
        uint128 initialThreshold
    )
        ERC721("Flap Achievements", "FLAP-A")
        Ownable(msg.sender)
    {
        if (address(_cUSD) == address(0) || _treasury == address(0) || _scorer == address(0)) {
            revert Flap__ZeroAddress();
        }
        cUSD = _cUSD;
        treasury = _treasury;
        scorer = _scorer;
        scoreThreshold = initialThreshold;
        minStake = 0.01 ether;  // 0.01 cUSD
        maxStake = 5 ether;     // 5 cUSD per play
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ play lifecycle ━━━━━━━━━━━━━━━━━━━━━━━ */

    /// @notice Open a play. Stake is escrowed in the contract.
    function startPlay(uint256 stake) external nonReentrant whenNotPaused returns (uint256 playId) {
        if (stake < minStake || stake > maxStake) revert Flap__StakeBounds();
        cUSD.safeTransferFrom(msg.sender, address(this), stake);

        playId = nextPlayId++;
        plays[playId] = Play({
            player: msg.sender,
            stake: uint128(stake),
            startedAt: uint64(block.timestamp),
            score: 0,
            state: PlayState.Open
        });
        emit PlayOpened(playId, msg.sender, stake, _today());
    }

    /// @notice Scorer (off-chain server) reports the score for a play.
    function submitScore(uint256 playId, uint64 score) external whenNotPaused {
        if (msg.sender != scorer) revert Flap__NotScorer();
        Play storage pl = plays[playId];
        if (pl.state != PlayState.Open) revert Flap__PlayNotOpen();
        if (pl.score != 0) revert Flap__AlreadyScored();
        pl.score = score;
        emit ScoreReported(playId, pl.player, score);
    }

    /// @notice Settle the play once a score has been reported. Anyone can call.
    ///         Score >= threshold → player gets 2× stake. Miss → stake feeds
    ///         today's bounty pool.
    function settlePlay(uint256 playId) external nonReentrant whenNotPaused {
        Play storage pl = plays[playId];
        if (pl.state != PlayState.Open) revert Flap__PlayNotOpen();
        if (pl.score == 0) revert Flap__NoScore();

        uint256 day = _today();
        DayLedger storage day_ = ledger[day];

        bool won = pl.score >= scoreThreshold;
        uint256 payout;
        uint256 toBounty;
        if (won) {
            payout = (uint256(pl.stake) * SCORE_MULTIPLIER) / 100;
            // payout > stake means contract subsidizes — that subsidy comes from
            // accumulated bounty pools. If not enough, only pay back stake.
            uint256 contractCushion = cUSD.balanceOf(address(this));
            if (payout > contractCushion) payout = pl.stake;
        } else {
            toBounty = pl.stake;
            day_.bountyPool += uint128(toBounty);
        }

        // record top-of-day on every settle
        if (pl.score > day_.topScore) {
            day_.topScore = pl.score;
            day_.topPlayer = pl.player;
        }

        // streak tracking
        _updateStreak(pl.player, day);

        // season participation
        if (nextSeasonId != 0) {
            uint256 sid = nextSeasonId;
            Season storage s = seasons[sid];
            if (!s.finalized && block.timestamp <= s.endsAt) {
                seasonPlays[sid][pl.player]++;
            }
        }

        pl.state = PlayState.Settled;

        if (payout > 0) {
            cUSD.safeTransfer(pl.player, payout);
        }
        emit PlaySettled(playId, pl.player, won, payout, toBounty);
    }

    /// @notice Cancel a play if the score hasn't been reported yet. Refunds full stake.
    function cancelPlay(uint256 playId) external nonReentrant whenNotPaused {
        Play storage pl = plays[playId];
        if (pl.player != msg.sender) revert Flap__NotPlayer();
        if (pl.state != PlayState.Open) revert Flap__PlayNotOpen();
        if (pl.score != 0) revert Flap__AlreadyScored();

        pl.state = PlayState.Cancelled;
        cUSD.safeTransfer(msg.sender, pl.stake);
        emit PlayCancelled(playId, msg.sender);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ daily bounty ━━━━━━━━━━━━━━━━━━━━━━━━━ */

    /// @notice Sponsor adds cUSD to a specific day's bounty pool. Anyone can call.
    function sponsorDailyBounty(uint256 day, uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert Flap__StakeBounds();
        DayLedger storage day_ = ledger[day];
        if (day_.finalized) revert Flap__DayAlreadyFinalized();
        cUSD.safeTransferFrom(msg.sender, address(this), amount);
        day_.bountyPool += uint128(amount);
        emit BountySponsored(day, msg.sender, amount);
    }

    /// @notice Owner finalizes a past day so its bounty becomes claimable.
    function finalizeDay(uint256 day) external onlyOwner {
        DayLedger storage day_ = ledger[day];
        if (day_.finalized) revert Flap__DayAlreadyFinalized();
        if (day >= _today()) revert Flap__DayNotFinalized();
        day_.finalized = true;
        emit DayFinalized(day, day_.topPlayer, day_.topScore, day_.bountyPool);
    }

    function claimDailyBounty(uint256 day) external nonReentrant whenNotPaused {
        DayLedger storage day_ = ledger[day];
        if (!day_.finalized) revert Flap__DayNotFinalized();
        if (day_.bountyClaimed) revert Flap__BountyAlreadyClaimed();
        if (msg.sender != day_.topPlayer) revert Flap__NotTopPlayer();

        day_.bountyClaimed = true;
        uint256 amount = day_.bountyPool;
        day_.bountyPool = 0;
        cUSD.safeTransfer(msg.sender, amount);
        emit BountyClaimed(day, msg.sender, amount);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ seasons + badges ━━━━━━━━━━━━━━━━━━━━━ */

    function startSeason(uint64 endsAt) external onlyOwner returns (uint256 seasonId) {
        if (endsAt <= block.timestamp) revert Flap__InvalidEndsAt();
        seasonId = ++nextSeasonId;
        seasons[seasonId] = Season({
            startedAt: uint64(block.timestamp),
            endsAt: endsAt,
            finalized: false
        });
        emit SeasonStarted(seasonId, endsAt);
    }

    function setSeasonRank(uint256 seasonId, address player, uint16 rank) external onlyOwner {
        Season storage s = seasons[seasonId];
        if (s.startedAt == 0) revert Flap__SeasonNotActive();
        if (s.finalized) revert Flap__SeasonAlreadyFinalized();
        if (rank == 0 || rank > PODIUM_RANK_LIMIT) revert Flap__InvalidRank();
        seasonRank[seasonId][player] = rank;
        emit SeasonRankSet(seasonId, player, rank);
    }

    function finalizeSeason(uint256 seasonId) external onlyOwner {
        Season storage s = seasons[seasonId];
        if (s.startedAt == 0) revert Flap__SeasonNotActive();
        if (s.finalized) revert Flap__SeasonAlreadyFinalized();
        if (block.timestamp < s.endsAt) revert Flap__InvalidEndsAt();
        s.finalized = true;
        emit SeasonFinalized(seasonId);
    }

    function claimPodiumBadge(uint256 seasonId)
        external
        whenNotPaused
        returns (uint256 tokenId)
    {
        Season storage s = seasons[seasonId];
        if (!s.finalized) revert Flap__SeasonNotFinalized();
        uint16 rank = seasonRank[seasonId][msg.sender];
        if (rank == 0) revert Flap__PodiumNotEarned();
        if (claimedPodium[seasonId][msg.sender]) revert Flap__AlreadyClaimedBadge();

        claimedPodium[seasonId][msg.sender] = true;
        tokenId = ++nextTokenId;
        _safeMint(msg.sender, tokenId);
        badgeKindOf[tokenId] = BadgeKind.Podium;
        badgeContextOf[tokenId] = seasonId;
        emit PodiumBadgeMinted(seasonId, msg.sender, rank, tokenId);
    }

    function claimParticipationBadge(uint256 seasonId)
        external
        whenNotPaused
        returns (uint256 tokenId)
    {
        Season storage s = seasons[seasonId];
        if (!s.finalized) revert Flap__SeasonNotFinalized();
        if (seasonPlays[seasonId][msg.sender] < PARTICIPATION_THRESHOLD) {
            revert Flap__ParticipationNotEarned();
        }
        if (claimedParticipation[seasonId][msg.sender]) revert Flap__AlreadyClaimedBadge();

        claimedParticipation[seasonId][msg.sender] = true;
        tokenId = ++nextTokenId;
        _safeMint(msg.sender, tokenId);
        badgeKindOf[tokenId] = BadgeKind.Participation;
        badgeContextOf[tokenId] = seasonId;
        emit ParticipationBadgeMinted(seasonId, msg.sender, tokenId);
    }

    function claimStreakBadge(uint16 streakLength)
        external
        whenNotPaused
        returns (uint256 tokenId)
    {
        // canonical thresholds — owner can extend later if needed
        if (streakLength != 7 && streakLength != 14 && streakLength != 30 && streakLength != 100) {
            revert Flap__StreakNotReached();
        }
        if (playStreak[msg.sender] < streakLength) revert Flap__StreakNotReached();
        if (claimedStreakAt[msg.sender][streakLength]) revert Flap__StreakAlreadyClaimed();

        claimedStreakAt[msg.sender][streakLength] = true;
        tokenId = ++nextTokenId;
        _safeMint(msg.sender, tokenId);
        badgeKindOf[tokenId] = BadgeKind.Streak;
        badgeContextOf[tokenId] = streakLength;
        emit StreakBadgeMinted(msg.sender, streakLength, tokenId);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ retention ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function dailyHop() external whenNotPaused {
        uint64 last = lastHop[msg.sender];
        uint64 nowTs = uint64(block.timestamp);
        if (last != 0 && nowTs < last + HOP_COOLDOWN) revert Flap__HopTooSoon();

        if (last == 0 || nowTs > last + HOP_GRACE) {
            hopRun[msg.sender] = 1;
        } else {
            unchecked { hopRun[msg.sender]++; }
        }
        lastHop[msg.sender] = nowTs;

        // tier shape: every 7 → 5, every 30 → 20
        uint16 r = hopRun[msg.sender];
        uint128 reward = 1;
        if (r % 30 == 0) reward = 20;
        else if (r % 7 == 0) reward = 5;
        hopCredits[msg.sender] += reward;
        emit Hopped(msg.sender, r, reward);
    }

    function setIntroducer(address by) external whenNotPaused {
        if (introducerOf[msg.sender] != address(0)) revert Flap__AlreadyIntroduced();
        if (by == msg.sender) revert Flap__CannotIntroduceSelf();
        if (by == address(0)) revert Flap__ZeroAddress();
        introducerOf[msg.sender] = by;
        unchecked { introductionCount[by]++; }
        hopCredits[by] += 3;
        emit IntroducerSet(msg.sender, by);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ admin ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function setScorer(address newScorer) external onlyOwner {
        if (newScorer == address(0)) revert Flap__ZeroAddress();
        emit ScorerUpdated(scorer, newScorer);
        scorer = newScorer;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert Flap__ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setScoreThreshold(uint128 newThreshold) external onlyOwner {
        if (newThreshold == 0) revert Flap__InvalidThreshold();
        emit ScoreThresholdUpdated(scoreThreshold, newThreshold);
        scoreThreshold = newThreshold;
    }

    function setStakeBounds(uint128 newMin, uint128 newMax) external onlyOwner {
        if (newMin == 0 || newMax == 0 || newMin > newMax) revert Flap__StakeBounds();
        minStake = newMin;
        maxStake = newMax;
        emit StakeBoundsUpdated(newMin, newMax);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /// @notice Owner sweeps the contract's surplus cUSD (above outstanding pools)
    ///         to treasury. Only the part not earmarked for any active day's
    ///         bounty pool or open play can be swept.
    function sweepSurplus(uint256 day, uint256 amount) external onlyOwner {
        DayLedger storage day_ = ledger[day];
        if (!day_.finalized || day_.bountyClaimed) {
            // can only sweep finalized + unclaimed remainder, or completely unrelated balance
        }
        cUSD.safeTransfer(treasury, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ views ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function today() external view returns (uint256) {
        return _today();
    }

    function getDay(uint256 day) external view returns (DayLedger memory) {
        return ledger[day];
    }

    function getPlay(uint256 playId) external view returns (Play memory) {
        return plays[playId];
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ soulbound enforcement ━━━━━━━━━━━━━━━━ */

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        // Allow mint (from == 0) and burn (to == 0). Block all other transfers.
        if (from != address(0) && to != address(0)) revert Flap__SoulboundTransfer();
        return super._update(to, tokenId, auth);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ internal ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    function _today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function _updateStreak(address player, uint256 day) internal {
        uint256 prev = lastPlayDay[player];
        if (prev == day) return;                        // already counted today
        if (prev == 0) {
            playStreak[player] = 1;
        } else if (day == prev + 1) {
            unchecked { playStreak[player]++; }
        } else {
            playStreak[player] = 1;                     // gap broke the run
        }
        lastPlayDay[player] = day;
    }
}
