
int permit_recruit(object ob)
{
        if (ob->query("detach/全真教") || ob->query("betrayer/全真教"))
        {
                command("say 你当年既然离开全真教，何必又要回来？");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 我们全真教乃名门正派，决不收判师之徒！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "全真教")
        {
                command("say 你既然已经有了名师指点，不好好学习，来我们全真教作甚？");
                return 0;
        }

        return 1;
}
