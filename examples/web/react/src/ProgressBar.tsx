import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BkgBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.6);
  border-radius: 2px;
`;

const Bar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.1s;
  width: 0%;
  height: 100%;
  background: #fff;
  border-radius: 2px;
`;

type ProgressBarProps = {
  progress: number
}

function ProgressBar(props: ProgressBarProps) {    
    return (
      <>
        <Container>
          <BkgBar></BkgBar>
          <Bar style={{ width: props.progress + '%' }}></Bar>
        </Container>
      </>
    );
}

export default ProgressBar;