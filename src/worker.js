import GeneticAlgorithm from "./PCPViz/DataProcessing/GeneticAlgorithm";

export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.addEventListener("message", e => {
        // eslint-disable-line no-restricted-globals
        if (!e) return;

        const users = [];

        const userDetails = {
            name: "Jane Doe",
            email: "jane.doe@gmail.com",
            id: 1
        };

      //  console.log("yaho")
        GeneticAlgorithm();
        /*for (let i = 0; i < 100000; i++) {
            userDetails.id = i++;
            userDetails.dateJoined = Date.now();
            users.push(userDetails);

        }*/

        postMessage(users);

    });
};