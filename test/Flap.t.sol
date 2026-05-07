// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { Test } from "forge-std/Test.sol";
import { Flap } from "../contracts/Flap.sol";
import { IERC20 } from "openzeppelin/token/ERC20/IERC20.sol";
import { CelodMock } from "./mocks/CelodMock.sol";

contract FlapTest is Test {
    Flap flap;
    CelodMock cUSD;

    address owner    = makeAddr("owner");
    address treasury = makeAddr("treasury");
    address scorer   = makeAddr("scorer");
    address alex     = makeAddr("alex");
    address rio      = makeAddr("rio");
    address sam      = makeAddr("sam");

    uint128 constant THRESHOLD = 100;

    function setUp() public {
        cUSD = new CelodMock();
        vm.prank(owner);
        flap = new Flap(IERC20(address(cUSD)), treasury, scorer, THRESHOLD);

        cUSD.mint(alex, 100 ether);
        cUSD.mint(rio,  100 ether);
        cUSD.mint(sam,  100 ether);

        vm.prank(alex); cUSD.approve(address(flap), type(uint256).max);
        vm.prank(rio);  cUSD.approve(address(flap), type(uint256).max);
        vm.prank(sam);  cUSD.approve(address(flap), type(uint256).max);

        // start fresh — anchor today() to a stable unix-day index
        vm.warp(1_900_000_000);
    }

    /* ── play lifecycle ───────────────────────────────────────────────────── */

    function test_startPlay_recordsAndEscrows() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        Flap.Play memory pl = flap.getPlay(id);
        assertEq(pl.player, alex);
        assertEq(pl.stake, 0.1 ether);
        assertEq(uint256(pl.state), uint256(Flap.PlayState.Open));
        assertEq(cUSD.balanceOf(address(flap)), 0.1 ether);
    }

    function test_startPlay_belowMin_reverts() public {
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__StakeBounds.selector);
        flap.startPlay(0.001 ether);
    }

    function test_startPlay_aboveMax_reverts() public {
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__StakeBounds.selector);
        flap.startPlay(10 ether);
    }

    function test_submitScore_byScorer() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id, 80);
        assertEq(flap.getPlay(id).score, 80);
    }

    function test_submitScore_byNonScorer_reverts() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__NotScorer.selector);
        flap.submitScore(id, 80);
    }

    function test_submitScore_alreadyScored_reverts() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.startPrank(scorer);
        flap.submitScore(id, 80);
        vm.expectRevert(Flap.Flap__AlreadyScored.selector);
        flap.submitScore(id, 100);
        vm.stopPrank();
    }

    function test_settle_winning_pays2x() public {
        // sponsor enough cushion for the 2x payout
        uint256 day = flap.today();
        vm.prank(rio);
        flap.sponsorDailyBounty(day, 1 ether);

        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id, 150);

        uint256 alexBefore = cUSD.balanceOf(alex);
        flap.settlePlay(id);
        // 2x of 0.1 ether = 0.2 ether returned
        assertEq(cUSD.balanceOf(alex) - alexBefore, 0.2 ether);
        assertEq(uint256(flap.getPlay(id).state), uint256(Flap.PlayState.Settled));
    }

    function test_settle_losing_stakeFeedsBounty() public {
        uint256 day = flap.today();
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id, 50); // below threshold

        flap.settlePlay(id);

        Flap.DayLedger memory dl = flap.getDay(day);
        assertEq(dl.bountyPool, 0.1 ether);
    }

    function test_settle_recordsTopScorerOfDay() public {
        uint256 day = flap.today();

        vm.prank(alex);
        uint256 id1 = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id1, 80);
        flap.settlePlay(id1);

        vm.prank(rio);
        uint256 id2 = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id2, 200);
        flap.settlePlay(id2);

        Flap.DayLedger memory dl = flap.getDay(day);
        assertEq(dl.topPlayer, rio);
        assertEq(dl.topScore, 200);
    }

    function test_settle_noScore_reverts() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.expectRevert(Flap.Flap__NoScore.selector);
        flap.settlePlay(id);
    }

    function test_cancelPlay_refunds() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        uint256 before_ = cUSD.balanceOf(alex);
        vm.prank(alex);
        flap.cancelPlay(id);
        assertEq(cUSD.balanceOf(alex) - before_, 0.1 ether);
    }

    function test_cancelPlay_afterScore_reverts() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id, 80);
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__AlreadyScored.selector);
        flap.cancelPlay(id);
    }

    function test_cancelPlay_byNonPlayer_reverts() public {
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(rio);
        vm.expectRevert(Flap.Flap__NotPlayer.selector);
        flap.cancelPlay(id);
    }

    /* ── bounty pool ──────────────────────────────────────────────────────── */

    function test_sponsor_addsToDay() public {
        uint256 day = flap.today();
        vm.prank(rio);
        flap.sponsorDailyBounty(day, 0.5 ether);
        assertEq(flap.getDay(day).bountyPool, 0.5 ether);
    }

    function test_sponsor_finalizedDay_reverts() public {
        uint256 day = flap.today();
        // play + settle (loss) so the day has a top
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id, 50);
        flap.settlePlay(id);

        // jump forward + finalize
        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        flap.finalizeDay(day);

        vm.prank(rio);
        vm.expectRevert(Flap.Flap__DayAlreadyFinalized.selector);
        flap.sponsorDailyBounty(day, 0.5 ether);
    }

    function test_finalizeDay_currentDay_reverts() public {
        uint256 day = flap.today();
        vm.prank(owner);
        vm.expectRevert(Flap.Flap__DayNotFinalized.selector);
        flap.finalizeDay(day);
    }

    function test_finalize_then_topPlayer_claims() public {
        uint256 day = flap.today();
        // alex loses
        vm.prank(alex);
        uint256 id1 = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id1, 80);
        flap.settlePlay(id1);
        // rio loses higher (still below threshold)
        vm.prank(rio);
        uint256 id2 = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id2, 95);
        flap.settlePlay(id2);

        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        flap.finalizeDay(day);

        uint256 before_ = cUSD.balanceOf(rio);
        vm.prank(rio);
        flap.claimDailyBounty(day);
        assertEq(cUSD.balanceOf(rio) - before_, 0.2 ether);
    }

    function test_claimBounty_byNonTop_reverts() public {
        uint256 day = flap.today();
        vm.prank(alex);
        uint256 id = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id, 80);
        flap.settlePlay(id);

        vm.warp(block.timestamp + 1 days);
        vm.prank(owner);
        flap.finalizeDay(day);

        vm.prank(rio);
        vm.expectRevert(Flap.Flap__NotTopPlayer.selector);
        flap.claimDailyBounty(day);
    }

    /* ── streak ───────────────────────────────────────────────────────────── */

    function test_playStreak_buildsAcrossDays() public {
        for (uint256 i; i < 7; i++) {
            vm.prank(alex);
            uint256 id = flap.startPlay(0.1 ether);
            vm.prank(scorer);
            flap.submitScore(id, 50);
            flap.settlePlay(id);
            vm.warp(block.timestamp + 1 days);
        }
        assertEq(flap.playStreak(alex), 7);
    }

    function test_playStreak_breaksOnGap() public {
        // play day 1
        vm.prank(alex);
        uint256 id1 = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id1, 50);
        flap.settlePlay(id1);
        // skip 2 days
        vm.warp(block.timestamp + 3 days);
        vm.prank(alex);
        uint256 id2 = flap.startPlay(0.1 ether);
        vm.prank(scorer);
        flap.submitScore(id2, 50);
        flap.settlePlay(id2);
        assertEq(flap.playStreak(alex), 1);
    }

    function test_claimStreakBadge_at7() public {
        for (uint256 i; i < 7; i++) {
            vm.prank(alex);
            uint256 id = flap.startPlay(0.1 ether);
            vm.prank(scorer);
            flap.submitScore(id, 50);
            flap.settlePlay(id);
            vm.warp(block.timestamp + 1 days);
        }
        vm.prank(alex);
        uint256 tokenId = flap.claimStreakBadge(7);
        assertEq(flap.ownerOf(tokenId), alex);
        assertEq(uint256(flap.badgeKindOf(tokenId)), uint256(Flap.BadgeKind.Streak));
        assertEq(flap.badgeContextOf(tokenId), 7);
    }

    function test_claimStreakBadge_belowThreshold_reverts() public {
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__StreakNotReached.selector);
        flap.claimStreakBadge(7);
    }

    function test_claimStreakBadge_invalidValue_reverts() public {
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__StreakNotReached.selector);
        flap.claimStreakBadge(15);
    }

    /* ── seasons + badges ─────────────────────────────────────────────────── */

    function test_startSeason_byOwner() public {
        vm.prank(owner);
        uint256 sid = flap.startSeason(uint64(block.timestamp + 7 days));
        assertEq(sid, 1);
    }

    function test_setSeasonRank_then_claimPodium() public {
        vm.prank(owner);
        uint256 sid = flap.startSeason(uint64(block.timestamp + 7 days));
        vm.prank(owner);
        flap.setSeasonRank(sid, alex, 1);
        vm.warp(block.timestamp + 8 days);
        vm.prank(owner);
        flap.finalizeSeason(sid);
        vm.prank(alex);
        uint256 tokenId = flap.claimPodiumBadge(sid);
        assertEq(flap.ownerOf(tokenId), alex);
        assertEq(uint256(flap.badgeKindOf(tokenId)), uint256(Flap.BadgeKind.Podium));
    }

    function test_setSeasonRank_invalid_reverts() public {
        vm.prank(owner);
        uint256 sid = flap.startSeason(uint64(block.timestamp + 7 days));
        vm.prank(owner);
        vm.expectRevert(Flap.Flap__InvalidRank.selector);
        flap.setSeasonRank(sid, alex, 11); // PODIUM_RANK_LIMIT = 10
    }

    function test_claimParticipation_after5plays() public {
        vm.prank(owner);
        uint256 sid = flap.startSeason(uint64(block.timestamp + 7 days));

        for (uint256 i; i < 5; i++) {
            vm.prank(alex);
            uint256 id = flap.startPlay(0.1 ether);
            vm.prank(scorer);
            flap.submitScore(id, 50);
            flap.settlePlay(id);
            vm.warp(block.timestamp + 1 days);
        }

        vm.warp(block.timestamp + 8 days);
        vm.prank(owner);
        flap.finalizeSeason(sid);

        vm.prank(alex);
        uint256 tokenId = flap.claimParticipationBadge(sid);
        assertEq(flap.ownerOf(tokenId), alex);
    }

    function test_claimParticipation_under5_reverts() public {
        vm.prank(owner);
        uint256 sid = flap.startSeason(uint64(block.timestamp + 7 days));
        // alex plays 3 times only
        for (uint256 i; i < 3; i++) {
            vm.prank(alex);
            uint256 id = flap.startPlay(0.1 ether);
            vm.prank(scorer);
            flap.submitScore(id, 50);
            flap.settlePlay(id);
            vm.warp(block.timestamp + 1 days);
        }
        vm.warp(block.timestamp + 8 days);
        vm.prank(owner);
        flap.finalizeSeason(sid);

        vm.prank(alex);
        vm.expectRevert(Flap.Flap__ParticipationNotEarned.selector);
        flap.claimParticipationBadge(sid);
    }

    /* ── soulbound enforcement ────────────────────────────────────────────── */

    function test_badge_transfer_reverts() public {
        // earn a streak badge
        for (uint256 i; i < 7; i++) {
            vm.prank(alex);
            uint256 id = flap.startPlay(0.1 ether);
            vm.prank(scorer);
            flap.submitScore(id, 50);
            flap.settlePlay(id);
            vm.warp(block.timestamp + 1 days);
        }
        vm.prank(alex);
        uint256 tokenId = flap.claimStreakBadge(7);

        vm.prank(alex);
        vm.expectRevert(Flap.Flap__SoulboundTransfer.selector);
        flap.transferFrom(alex, rio, tokenId);
    }

    /* ── retention ────────────────────────────────────────────────────────── */

    function test_dailyHop_recordsRun() public {
        vm.prank(alex);
        flap.dailyHop();
        assertEq(flap.hopRun(alex), 1);
        assertEq(flap.hopCredits(alex), 1);
    }

    function test_dailyHop_tooSoon_reverts() public {
        vm.prank(alex);
        flap.dailyHop();
        vm.warp(block.timestamp + 5 hours);
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__HopTooSoon.selector);
        flap.dailyHop();
    }

    function test_dailyHop_7day_reward5() public {
        for (uint256 i; i < 7; i++) {
            vm.warp(block.timestamp + 24 hours);
            vm.prank(alex);
            flap.dailyHop();
        }
        // 6 of reward 1, plus 1 of reward 5 on the 7th
        assertEq(flap.hopRun(alex), 7);
        assertEq(flap.hopCredits(alex), 11);
    }

    function test_setIntroducer_creditsBoth() public {
        vm.prank(rio);
        flap.setIntroducer(alex);
        assertEq(flap.introducerOf(rio), alex);
        assertEq(flap.hopCredits(alex), 3);
    }

    function test_setIntroducer_self_reverts() public {
        vm.prank(alex);
        vm.expectRevert(Flap.Flap__CannotIntroduceSelf.selector);
        flap.setIntroducer(alex);
    }

    /* ── admin ────────────────────────────────────────────────────────────── */

    function test_setScoreThreshold_zeroBlocked() public {
        vm.prank(owner);
        vm.expectRevert(Flap.Flap__InvalidThreshold.selector);
        flap.setScoreThreshold(0);
    }

    function test_setStakeBounds_inverted_reverts() public {
        vm.prank(owner);
        vm.expectRevert(Flap.Flap__StakeBounds.selector);
        flap.setStakeBounds(uint128(1 ether), uint128(0.5 ether));
    }

    function test_pause_blocksStartPlay() public {
        vm.prank(owner);
        flap.pause();
        vm.prank(alex);
        vm.expectRevert();
        flap.startPlay(0.1 ether);
    }
}
