import { FC, useContext } from "react";
import * as Format from "../../format";
import Skeleton from "react-loading-skeleton";
import { useTotalValueSecured } from "../../api/total-value-secured";
import { AmountUnitSpace } from "../Spacing";
import { TextInter, TextRoboto, UnitText } from "../Texts";
import { WidgetTitle } from "../widget-subcomponents";
import { FeatureFlagsContext } from "../../feature-flags";
import { useScarcity } from "../../api/scarcity";
import JSBI from "jsbi";
import { pipe } from "../../fp";
import { useGroupedStats1 } from "../../api/grouped-stats-1";

const TooltipSecurityRatio: FC<{ onClickClose: () => void }> = ({
  onClickClose,
}) => {
  const ethPrice = useGroupedStats1()?.ethPrice;
  const totalValueSecured = useTotalValueSecured();
  const ethStaked = useScarcity()?.engines.staked;
  const { previewSkeletons } = useContext(FeatureFlagsContext);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={`
        relative
        flex flex-col gap-y-4
        bg-blue-tangaroa p-8 rounded-lg
        border border-blue-shipcove
        w-[22rem]
      `}
    >
      <img
        alt="a close button, circular with an x in the middle"
        className="md:hidden absolute w-6 right-5 top-5 hover:brightness-90 active:brightness-110 cursor-pointer select-none"
        onClick={onClickClose}
        src="/close.svg"
      />
      <img
        alt=""
        className="w-20 h-20 mx-auto rounded-full select-none"
        src={"/round-nerd-large.svg"}
      />
      <TextInter className="font-semibold">Security ratio</TextInter>
      <div>
        <TextInter className="whitespace-pre-wrap md:leading-normal">
          Ratio of total value secured (TVS) to economic security—lower is
          better.
        </TextInter>
      </div>
      <WidgetTitle>formula</WidgetTitle>
      <div className="flex items-center">
        <TextInter>=</TextInter>
        <div className="flex flex-col ml-2">
          <TextInter>total value secured</TextInter>
          <hr />
          <TextInter>economic security</TextInter>
        </div>
      </div>
      <div className="flex items-center">
        <TextInter>=</TextInter>
        <div className="flex flex-col ml-2">
          <TextInter>value secured by Ethereum</TextInter>
          <hr />
          <TextInter>value securing Ethereum</TextInter>
        </div>
      </div>
      <div className="flex items-center">
        <TextInter>=</TextInter>
        <div className="flex flex-col ml-2">
          <div>
            <TextRoboto>
              {totalValueSecured === undefined || previewSkeletons ? (
                <Skeleton inline width="2.4rem" />
              ) : (
                Format.formatTwoDigit(totalValueSecured.sum / 1e12)
              )}
              T
            </TextRoboto>
            <AmountUnitSpace />
            <UnitText>USD</UnitText>
            <AmountUnitSpace />
            <TextInter className="font-extralight text-blue-spindle">
              in ETH, ERC20s, NFTs
            </TextInter>
          </div>
          <hr />
          {totalValueSecured === undefined ? (
            <Skeleton inline width="2rem" />
          ) : (
            <div>
              <TextRoboto>
                {ethStaked === undefined ||
                ethPrice === undefined ||
                previewSkeletons ? (
                  <Skeleton inline width="2.4rem" />
                ) : (
                  pipe(
                    ethPrice.usd,
                    // We scale up a little, the numbers are huge, let's not drop precision we have.
                    (ethPrice) => Math.round(ethPrice * 1e2),
                    (ethPriceCentsFloat) => JSBI.BigInt(ethPriceCentsFloat),
                    (ethPriceCentsBI) =>
                      JSBI.multiply(ethStaked.amount, ethPriceCentsBI),
                    // 1e18 is Wei -> ETH, 1e12 is displaying in trillions, 1e2 is scaling down from using cents not dollars above.
                    // We then leave four orders of size, because we expect a number < 0, which a bigint cannot hold.
                    (num) =>
                      JSBI.divide(num, JSBI.BigInt(1e12 * 1e18 * 1e2 * 1e-4)),
                    // We then leave
                    (num) => JSBI.toNumber(num) / 1e4,
                    Format.formatTwoDigit,
                  )
                )}
                T
              </TextRoboto>
              <AmountUnitSpace />
              <UnitText>USD</UnitText>
              <AmountUnitSpace />
              <TextInter className="font-extralight text-blue-spindle">
                in staked ETH
              </TextInter>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TooltipSecurityRatio;
