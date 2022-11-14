import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  padding: 5px 30px;

  @media (min-width: 768px) {
    padding: 10px 40px;
  }
  @media (min-width: 1024px) {
    padding: 20px 60px;
  }
`;

const Brand1 = styled.img`
  margin-left: 20px;
  height: 20px;
  @media (min-width: 768px) {
    height: 30px;
  }
  @media (min-width: 1024px) {
    height: 40px;
  }
`;
const Brand2 = styled.img`
  margin-right: 20px;
  height: 30px;
  @media (min-width: 768px) {
    height: 45px;
  }
  @media (min-width: 1024px) {
    height: 60px;
  }
`;

function Header() {
  return (
    <>
      <Container>
        <a href="https://mxlabs.ai/en/sdk" rel="noreferrer" target="_blank">
          <Brand1 src="mx.webp"></Brand1>
        </a>
        <a href="https://mxlabs.ai/en/sdk" rel="noreferrer" target="_blank">
          <Brand2 src="poweredby_shenai.svg"></Brand2>
        </a>
      </Container>
    </>
  );
}

export default Header;
