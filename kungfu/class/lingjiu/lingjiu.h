int permit_recruit(object ob)
{
        if( ob->query("detach/灵鹫宫") ||
            ob->query("betrayer/灵鹫宫") )
        {
                command("say 离开了缥缈峰就不要再回来！");
                return 0;
        }

        if( ob->query("betrayer/times") )
        {
                command("say 阁下不忠不信，我们灵鹫宫最恨的就是你这种人。");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "灵鹫宫" )
        {
                command("say 你有了师傅，就不要来我们灵鹫宫了！");
                return 0;
        }

        return 1;
}
