
void init()
{
        object me = this_player();

        if (! interactive(me)
           || me->is_fighting()
           || ! living(this_object()))
                return;

        if (me->query_temp("have_yitianjian")
           || present("yitian jian", me))
        {
                command("say 咦？倚天剑怎么会在你手里，看来"
                        "这次中原之行没白跑了！");
                this_object()->kill_ob(me);
                return;
        }

        if (me->query_temp("have_tulongdao")
           || present("tulong dao", me))
        {
                command("say 哼，把屠龙刀交出来，我们已经守"
                        "侯多时了！");
                this_object()->kill_ob(me);
                return;
        }

        if (present("shenghuo ling", me))
        {
                command("say 咦？你怎么会拿着有我教的圣火令"
                        "，快还给我！");
                this_object()->kill_ob(me);
                return;
        }
}

int recognize_apprentice(object me, string skill)
{
        if (me->query("shen") > 1000)
        {
                command("say 叽哩古拉，花不鲁鲁，你这人看上"
                        "去不象是好人，开滚。");
                return -1;
        }

        if (skill != "sanscrit")
        {
                command("say 教你点我在印度学的一点东西，你"
                        "还不知足啊？");
                return -1;
        }
        return 1;
}

