import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  margin-bottom: 3.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
  padding-left: 4rem;
  padding-right: 4rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid #43384b;
  box-shadow: 0px 16px 70px rgba(0, 0, 0, 0.4);
`;

export const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

export const CardWrapper = styled.div<{
  fullWidth?: boolean;
  disabled: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '250px')};
  background-color: ${({ theme }) => theme.colors.background.default};
  margin-bottom: 2.4rem;
  padding-left: 2.4rem;
  padding-right: 2.4rem;
  padding-bottom: 2.4rem;
  border-left: 2px solid ${({ theme }) => theme.colors.border.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 155%;
`;

export const Title = styled.p`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.large};
  margin-left: 16px;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
  height: 100%;
  align-self: center;
  height: 24px;
  margin-top: 0px;
  margin-bottom: 0px;
  color: ${({ theme }) => theme.colors.text.default};
`;

export const Description = styled.div`
  margin-bottom: 2.4rem;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-self: start;
  justify-content: space-around;
`;
