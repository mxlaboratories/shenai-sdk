import styled from "styled-components";

const Loading = styled.div`
&{
  display: inline-block;
  width: 160px;
  height: 160px;
}
&:after {
  content: " ";
  display: block;
  width: 128px;
  height: 128px;
  margin: 16px;
  border-radius: 50%;
  border: 8px solid #aaa;
  border-color: #aaa transparent #aaa transparent;
  animation: lds-dual-ring 1.5s linear infinite;
}
@keyframes lds-dual-ring{
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default Loading;