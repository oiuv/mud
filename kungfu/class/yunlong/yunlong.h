// check recruit

int permit_recruit(object ob)
{
	command("say 对不起，我云龙门不对外收徒。");
        return 0;
        
        if (ob->query("detach/云龙门") || ob->query("betrayer/云龙门"))
        {
                command("say 你当年既然离开云龙门们，就不必回来了！");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 我们云龙门反清复明，最讲信义，你走吧！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "云龙门")
        {
                command("sigh");
                command("shake");
                return 0;
        }

        return 1;
}
