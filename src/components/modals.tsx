"use client";

import { SubscriptionModal } from "@/features/subscription/components/subscription-modal";
import { FailModal } from "@/features/subscription/components/fail-modal";
import { SuccessModal } from "@/features/subscription/components/success-modal";
import { SubscriptionAlert } from "@/features/subscription/components/subscription-alert";
import { useEffect, useState } from "react";

export const Modals = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);
	if (!isMounted) {
		return null;
	}

	return (
		<>
			<SubscriptionAlert />
			<FailModal />
			<SuccessModal />
			<SubscriptionModal />
		</>
	);
};
