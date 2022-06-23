import styled from "styled-components";

const Container = styled.div`
font-family: 'Roboto', sans-serif;
display: flex;
flex-direction: column;
padding: 10px 50px 5px 10px;
align-items: start;
justify-content: flex-start;
margin: 5px;
border-radius: 5px;
background: #fff;
background-position: right center;
background-repeat: no-repeat;
background-size: auto 60%;
`;

const InnerContainer = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
`;

const Title = styled.div`
  font-size: 0.55em;
  margin-left: 3px;
`;

const Value = styled.div`
  font-weight: 800;
  font-size: 1.5em;
  margin-right: 5px;
  margin-bottom: -10px;
`;

const Unit = styled.div`
  font-size: 0.5em;
`;

type ResultProps = {
  title: string,
  value: string,
  unit: string,
  bkg: string
}

function Result(props: ResultProps) {
    return (
      <>
        <Container style={{backgroundImage: "url('" + props.bkg + "')"}}>
          <Title>{props.title}</Title>
          <InnerContainer>
            <Value>{props.value}</Value>
            <Unit>{props.unit}</Unit>
          </InnerContainer>
        </Container>
      </>
    );
}

export default Result;