// xuan.h for fight and get letter from Xuan

#include "shaolin.h"

int accept_object(object ob, object obj)
{
        object me = this_object();

#if IS_XUAN_CI
        int r;

        if (r = ::accept_object(ob, obj))
                return r;
#endif

        if (obj->query("id") == "tuijian xin4" &&
            ob->query_temp("have_letter"))
        {
                ob->set_temp("apprentice_ok",1);
                command("say 好，" + ob->query("name") +
                        "，你愿意拜我为师吗？");
                destruct(obj);
                return 1;
        }

        command("smile");
        command("say 这东西给我可没有什麽用。");
        command("give " + obj->query("id") + " to " + me->query("id"));
        return 0;
}

void attempt_apprentice(object ob)
{
        object me  = this_object();
        mapping ob_fam;
        mapping my_fam  = me->query("family");

        string name, new_name;

        if (! permit_recruit(ob))
                return;

        if (! (ob_fam = ob->query("family")) ||
            ob_fam["family_name"] != "少林派")
        {
                command("say " + RANK_D->query_respect(ob) +
                        "与本派素无来往，不知此话从何谈起？");
                return;
        }

        if ((string)ob->query("class") != "bonze" &&
            ob_fam["family_name"] == "少林派") 
        {
                command("say " + RANK_D->query_respect(ob) +
                        "是俗家弟子，不能在寺内学艺。");
                return;
        }

        if (ob_fam["generation"] <= my_fam["generation"])
        {
                command("say " + RANK_D->query_respect(ob) +
                        "，贫僧哪里敢当 !");
                return;
        }

        if (ob_fam["generation"] == (my_fam["generation"] + 1))
        {
                command("say " + ob_fam["master_name"] +
                        "的徒弟怎麽跑到我这儿来了，哈哈哈 !");
                command("recruit " + ob->query("id"));
        }

        if (ob_fam["generation"] == (my_fam["generation"] + 2))
        {
                if (ob->query_temp("apprentice_ok") ||
                    ob->query("luohan_winner"))
                {
                        ob->delete_temp("have_letter");
                        ob->delete_temp("apprentice_ok");
        
                        command("say 是" + ob_fam["master_name"] +
                                "叫你来找我的吧，哈哈哈！");
                        command("say 贫僧又得一可塑之才，真是可喜可贺！");

                        name = ob->query("name");
                        new_name = "澄" + name[2..3];
                        ob->set("name", new_name);

                        command("say 从今以后你的法名叫做" + new_name +
                                "，恭喜你荣升为少林派澄字辈弟子！");
                        command("recruit " + ob->query("id"));
                } else
                {
                        command("say " + RANK_D->query_respect(ob) +
                                "，你既没有推荐信，也没有过罗汉阵，"
                                "不能越级拜师。");
                        return;
                }
        }

        return;
}
