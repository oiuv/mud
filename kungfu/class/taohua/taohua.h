int permit_recruit(object ob)
{
        if (ob->query("detach/桃花岛")
           || ob->query("betrayer/桃花岛"))
        {
                command("say 亏你还有脸回桃花岛？滚！");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 阁下不忠不信，我最痛恨你这种人了。");
                return 0;
        }

        if (ob->query("family/family_name")
           && ob->query("family/family_name") != "桃花岛" )
        {
                command("say 你既有了名师指点，还来我们桃花岛做什么？");
                return 0;
        }

        return 1;
}
