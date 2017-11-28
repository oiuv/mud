int permit_recruit(object ob)
{
        if (ob->query("detach/中原苗家") || ob->query("betrayer/中原苗家"))
        {
                command("heng");
                command("say 你反复无常，我不能收你为徒！");
                return 0;
        }

        if (ob->query("born_family") != "中原苗家")
        {
                command("hmm");
                command("say 我苗家向来便不收容外人。");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "中原苗家")
        {
                command("hmm");
                command("say 你既已在外面投师学艺，就应有所作为，又跑回来作甚？");
                return 0;
        }

        return 1;
}
