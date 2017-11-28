
int permit_recruit(object ob)
{
        if (ob->query("detach/灵鹫宫") ||
            ob->query("betrayer/灵鹫宫"))
        {
                command("say 你既然已经背叛了主公，我可不敢再作收留。");
                return 0;
        }

        if (ob->query("family/family_name") &&
            ob->query("family/family_name") == "灵鹫宫")
        {
                command("say 你既然已经投入了主公门下，我自然不会吝啬我所知的武功。");
                command("say 若有需要，你直接来找我学好了，不用再作拜师之礼。");
                return 0;
        }

        if (ob->query("family/family_name"))
        {
                command("say 找你的师父去，别来跟我罗嗦。");
                return 0;
        }

        return 1;
}
