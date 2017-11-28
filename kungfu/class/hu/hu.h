
int permit_recruit(object ob)
{
        if( ob->query("detach/关外胡家") || ob->query("betrayer/关外胡家") )
        {
                command("say 你反复无常，我不能收你为徒！");
                return 0;
        }

        if (ob->query("born_family") != "关外胡家")
        {
                command("hmm");
                command("say 我关外胡家虽然人丁稀少，但也不收纳族外之人。");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "关外胡家")
        {
                command("hmm");
                command("say 你既然已经离家拜师，就应有所作为，又跑回来作甚？");
                return 0;
        }

        return 1;
}

