// check recruit

int permit_recruit(object ob)
{
        if (ob->query("detach/血刀门") || ob->query("betrayer/血刀门"))
        {
                command("say 你离开了血刀门们，就别回来！");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 判师之徒，哼！哼！我把你千刀万剐！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "血刀门")
        {
                command("say 你不是已经有了师傅么，还来干什么？偷学我派秘技啊！");
                return 0;
        }

        return 1;
}
