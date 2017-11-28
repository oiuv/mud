// check recruit

int permit_recruit(object ob)
{
        if (ob->query("detach/逍遥派") || ob->query("betrayer/逍遥派"))
        {
                command("say 你当年都已经离开了逍遥派，何必又要回来？");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 我们逍遥派乃名门正派，决不收判师之徒！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "逍遥派")
        {
                command("say 你既然已经有了名师指点，不好好学习，来我们逍遥派作甚？");
                return 0;
        }

        if (ob->query("per") < 28)
        {
                command("look "+ ob->query("id")); 
                command("say " + RANK_D->query_respect(ob) + "的尊容未免次了"
                        "点，这样可入不了我们逍遥派！");
                return 0;
        }

        return 1;
}
