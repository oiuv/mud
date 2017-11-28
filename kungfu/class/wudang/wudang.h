// check recruit

int permit_recruit(object ob)
{
        if( ob->query("detach/武当派") || ob->query("betrayer/武当派") )
        {
                command("say 你当年既然离开武当派，何必又要回来？");
                return 0;
        }

        if( ob->query("betrayer/times") )
        {
                command("say 我们武当派乃名门正派，决不收判师之徒！");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "武当派" )
        {
                command("say 你既然已经有了名师指点，不好好学习，来我们武当派作甚？");
                return 0;
        }

        return 1;
}
