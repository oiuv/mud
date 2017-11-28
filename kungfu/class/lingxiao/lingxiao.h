// check recruit

int permit_recruit(object ob)
{
        command("say 对不起，我雪山剑派不对外收徒。");
        return 0;
        /*
        if (ob->query("detach/凌霄城") || ob->query("betrayer/凌霄城"))
        {
                command("say 你当年既然已经离开凌霄城，现在何必又要回来？");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 我们雪山凌霄城最恨就是你这样的背信弃义之徒！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "凌霄城" &&
            ob->query("family/family_name") != "玄素庄" &&
            ob->query("family/master_name") != "石清")
        {
                command("say 你既然已经有了名师指点，还来我们雪山剑派干嘛？");
                return 0;
        }

        return 1;
        */
}
