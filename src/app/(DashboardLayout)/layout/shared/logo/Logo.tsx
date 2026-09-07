import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "180px",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  return (
    <LinkStyled href="/dashboard">
      <Image src="/images/logos/logo_alcaldia_piritu.PNG" alt="Alcaldía de Píritu" height={70} width={174} priority style={{ objectFit: "contain" }} />
    </LinkStyled>
  );
};

export default Logo;
