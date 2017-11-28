// honghua.h
// create by Rcwiz 2003

int permit_recruit(object ob)
{
        if( ob->query("detach/明教") ||
            ob->query("betrayer/明教") )
        {
                command("say 我们明教教规你还记得吗，你还有脸回来！");
                return 0;
        }

        if( ob->query("betrayer/times") )
        {
                command("say 哼，阁下不忠不信，我们明教可不会收留。");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "明教" )
        {
                command("say 阁下既有了师承，还来我们明教做什么？");
                return 0;
        }

        return 1;
}

