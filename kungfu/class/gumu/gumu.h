int permit_recruit(object ob)
{

        if( ob->query("detach/古墓派") ||
            ob->query("betrayer/古墓派") )
        {
                command("say 唉！去便去了，回来又是何苦由来？");
                return 0;
        }

        if( ob->query("betrayer/times") )
        {
                command("say 阁下不忠不信，我不敢收你为徒。");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "古墓派" )
        {
                command("say 你既有了名师指点，就要勤下苦功，勿要三心二意！");
                return 0;
        }

        return 1;
}
