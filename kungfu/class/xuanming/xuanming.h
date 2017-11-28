int permit_recruit(object ob)
{

        if( ob->query("detach/玄冥谷") ||
            ob->query("betrayer/玄冥谷") )
        {
                command("say 哼，你既然走了就不要再回来！");
                return 0;
        }

        if( ob->query("betrayer/times") )
        {
                command("say 阁下不忠不信，我不敢收你为徒。");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "玄冥谷" )
        {
                command("say 你既有了名师指点，就要勤下苦功，勿要三心二意！");
                return 0;
        }

        return 1;
}
