// check recruit

int permit_recruit(object ob)
{
        if (ob->query("detach/梅庄") || ob->query("betrayer/梅庄"))
        {
                command("say 你当年既然已经离开本庄，现在何必又要回来？");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 我梅庄虽小，但是也不会接纳你这样的背信弃义之徒！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "梅庄" &&
            ob->query("family/family_name") != "日月神教" &&
            ob->query("family/master_name") != "东方不败")
        {
                command("say 你既然已经有了名师指点，还来我们梅庄干嘛？");
                return 0;
        }

        return 1;
}
