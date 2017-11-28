// duan.h

int permit_recruit(object ob)
{
        if (ob->query("detach/段氏皇族") || ob->query("betrayer/段氏皇族"))
        {
                command("say 既然离开了我们段家，就不要回来了");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 哼，我们大理段氏最痛恨的就是不忠不义之徒。");
                return 0;
        }

        if (ob->query("born_family") != "段氏皇族")
        {
                command("shake");
                command("say 我们段家乃皇族出身，不收外人。");
                return 0;
        }

        if (ob->query("family/family_name")
           && ob->query("family/family_name") != "段氏皇族")
        {
                command("hmm");
                command("say 你当年跑出去的时候怎么就没想过要回来？");
                return 0;
        }

        return 1;
}
