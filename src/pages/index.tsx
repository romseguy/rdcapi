export const getServerSideProps = () => {
  return { redirect: { permanent: false, destination: "/nope" } };
};
export default () => "redirecting";
