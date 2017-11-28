
int permit_recruit(object ob)
{
        if (ob->query("detach/慕容世家") || ob->query("betrayer/慕容世家"))
        {
                command("sneer");
                command("say 你吃里爬外，反复无常，叫我如何收你？");
                return 0;
        }

        if (ob->query("born_family") != "慕容世家")
        {
                command("sneer");
                command("say 你不是我们慕容家的人，师徒就免了吧。");
                return 0;
        }

        if (ob->query("family/family_name")
           && ob->query("family/family_name") != "慕容世家")
        {
                command("sneer");
                command("say 你既然已经离家拜师，又跑回来作甚？");
                return 0;
        }

        if (ob->query("name") == "慕容博"
           || ob->query("name") == "慕容复")
        {
                command("killair");
                command("say 你起这个名字算是什么意思？");
                return 0;
        }
        return 1;
}

