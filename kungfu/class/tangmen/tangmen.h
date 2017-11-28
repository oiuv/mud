int permit_recruit( object ob )
{
	
	 command("say 对不起，唐门暂不收徒，你过段时间再来吧。");
	 return 0;
	 

	if ( ob->query( "detach/唐门世家" ) || ob->query( "betrayer/唐门世家" ) )
	{
		command( "say 你反复无常，我不能收你为徒！" );
		return(0);
	}

	if ( ob->query( "betrayer/times" ) )
	{
		command( "say 哼，我们唐门世家最痛恨的就是不忠不义之徒。" );
		return(0);
	}

	if ( ob->query( "born_family" ) != "唐门世家" && !ob->query( "reborn/times" ) )
	{
		command( "hmm" );
		command( "say 我们唐门世家乃世家出身，不收外人。" );
		return(0);
	}

	if ( ob->query( "family/family_name" ) &&
	     ob->query( "family/family_name" ) != "唐门世家" )
	{
		command( "hmm" );
		command( "say 你既然已经离家拜师，就应有所作为，又跑回来作甚？" );
		return(0);
	}

	return(1);
}
