int permit_recruit(object ob)
{
//command("say 对不起，少林暂不开放。");return 0;


        if (ob->query("detach/少林派") ||
            ob->query("betrayer/少林派"))
        {
                command("say 你反反复复，唉！怎么一心向佛？");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 你大逆不道，私自判师，不能容于少林！");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "少林派")
        {
                command("say 你已经名师指点，为何不下苦功，反而来我们"
                        "少林寺呢？");
                return 0;
        }

        return 1;
}
