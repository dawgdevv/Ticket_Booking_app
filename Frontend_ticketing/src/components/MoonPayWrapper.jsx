import { MoonPayProvider } from "@moonpay/moonpay-react";
import PropTypes from "prop-types";

const MoonPayWrapper = ({ children }) => {
  // Use test API key in development, production key in production
  const apiKey = import.meta.env.VITE_MOONPAY_TEST_PUBLIC_KEY;

  return (
    <MoonPayProvider apiKey={apiKey} debug={true} environment="sandbox">
      {children}
    </MoonPayProvider>
  );
};

MoonPayWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MoonPayWrapper;
