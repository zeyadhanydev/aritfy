"use client";

import { SubscriptionModal } from "@/features/subscription/components/subscription-modal";
import { FailModal } from "@/features/subscription/components/fail-modal";
import { SuccessModal } from "@/features/subscription/components/success-modal";
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
			<FailModal />
			<SuccessModal />
			<SubscriptionModal />
		</>
	);
};
