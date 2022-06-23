import styled from "styled-components";
import { supportedBrowsers } from "shenai-sdk";
import Header from "./Header";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 100vw;
`;
const TextWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
  justify-content: center;
  align-items: center;
  padding: 50px;
`;

function UpgradeBrowser() {
  return (
    <>
      <Wrapper>
        <Header />
        <TextWrapper>
          Your browser is not capable of running this application. Please upgrade to {
            supportedBrowsers.map((e) => e.name + ' ' + e.min_version).join(', ')
          } or newer.
        </TextWrapper>
      </Wrapper>
    </>
  );
}

export default UpgradeBrowser;
