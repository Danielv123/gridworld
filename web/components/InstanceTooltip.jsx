import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Button, Select, InputNumber, Checkbox } from "antd";

import { useInstance } from "@clusterio/web_ui";

function InstanceTooltip(props) {
	let [instance] = useInstance(props.instance_id);

    return <>
        <p>{instance?.name}</p>
	</>;
}

export default InstanceTooltip;
