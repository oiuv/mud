// check recruit

int permit_recruit(object ob)
{
        if (ob->query("detach/大轮寺") || ob->query("betrayer/大轮寺"))
        {
                command("say 你既然已经离开了大轮寺，还跑回来干嘛？");
                return 0;
        }

        if (ob->query("betrayer/times"))
        {
                command("say 我们大轮寺最恨判师之徒，你还不快滚？");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") != "大轮寺")
        {
                command("say 你有师傅指点，当循序渐进，怎可贸然判师？");
                return 0;
        }

        return 1;
}
