import React from "react";
import styled from "styled-components";
import PageNotFoundSvg from "../assets/ErrorPage.svg";

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f9fafb;
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 120px;
  font-weight: 800;
  margin: 0;
  color: #111;

  @media (max-width: 768px) {
    font-size: 80px;
  }

  @media (max-width: 480px) {
    font-size: 60px;
  }
`;

const Subtitle = styled.h2`
  font-size: 24px;
  margin: 10px 0;
  color: #555;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const ImageWrapper = styled.div`
  margin: 30px 0;

  img {
    width: 100%;
    max-width: 600px;
    height: auto;
  }

  @media (max-width: 768px) {
    img {
      max-width: 300px;
    }
  }

  @media (max-width: 480px) {
    img {
      max-width: 220px;
    }
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #777;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;
const Button = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #111;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #333;
  }
`;

const NotFound = () => {
  return (
    <Container>
      <Content>
        {/* <Title>404</Title>
        <Subtitle>Page Not Found</Subtitle> */}

        <ImageWrapper>
          <img src={PageNotFoundSvg} alt="Not Found" />
        </ImageWrapper>

        <Description>
          The page you're looking for doesn’t exist.
        </Description>
        <Button onClick={() => window.history.back()}>
  Go Back
</Button>
      </Content>
    </Container>
  );
};

export default NotFound;