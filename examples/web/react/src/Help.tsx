import styled from "styled-components";
import { Button } from "antd";
import Header from "./Header";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 100vw;
`;

const HelpWrapper = styled.div`
  background: #fff;
  padding: 0 50px 50px 50px;
`;

const Title = styled.h1`
  font-size: 1.5em;
`;
const Description = styled.div`
  font-size: 0.9em;
  text-align: justify;
`;

const ButtonWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  padding-top: 10px;
`;

type HelpProps = {
  onClose: () => void
}

function Help(p: HelpProps) {
  return (
    <>
      <Wrapper>
        <Header />
        <HelpWrapper>
          <Title>Pomiar wideo</Title>
          <Description>
            <p>Za chwilę zmierzysz swój puls.</p>
            <p>Podczas pomiaru możliwa będzie obserwacja przepływu krwi pod skórą w czasie rzeczywistym.</p>
            <p>Aby uzyskać najlepszą dokładność, pomiar należy wykonywać w dobrze oświetlonym otoczeniu, nie wykonując żadnych gwałtownych ruchów, z twarzą umieszczoną stabilnie na środku ekranu.</p>
            <p>Heart Monitor jest wersją demonstracyjną produktu i nie może być używany do zbierania danych diagnostycznych. Ten pomiar nie zastępuje oceny klinicznej pracownika opieki zdrowotnej. Wszelkie dane dotyczące zdrowia, dostarczane przez aplikację, służą wyłącznie celom informacyjnym.</p>
          </Description>
          <ButtonWrapper>
            <Button onClick={p.onClose} type="primary" size="large">Dalej</Button>
          </ButtonWrapper>
        </HelpWrapper>
      </Wrapper>
    </>
  );
}

export default Help;