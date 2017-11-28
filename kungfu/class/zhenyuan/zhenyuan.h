// check recruit

int permit_recruit(object ob)
{
        if( ob->query("detach/八卦门") || ob->query("betrayer/八卦门") )
        {
                command("say 你当年既然已经离开了咱镖局，现在干嘛又要回来？");
                return 0;
        }

        if( ob->query("betrayer/times") )
        {
                command("say 嘿！咱镖局留着你这样的背信弃义之徒肯定是吃里爬外！");
                return 0;
        }

        if( ob->query("family/family_name") &&
            ob->query("family/family_name") != "八卦门" &&
            ob->query("family/family_name") != "商家堡" &&
            ob->query("family/master_name") != "商剑鸣" )
        {
                command("say 不妥，不妥！你已经有师承了。");
                return 0;
        }

        return 1;
}
