export const defaultCode = `
  export default class Page extends Component {
    // Define the state your page needs here
    state = {
      test: 1,
      aaa: 2
    }

    testFunc() {
      console.log('test func lowcode');
      return (
        <div className="aa">
          {this.state.test}
        </div>
      );
    }
  }
`;
