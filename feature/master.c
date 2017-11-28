// master.c

#include <dbase.h>
#include <login.h>
#include <ansi.h>

int prevent_learn(object me, string skill)
{
    mapping fam;

    if (! me->is_apprentice_of(this_object()) &&
        mapp(fam = me->query("family")) &&
            fam["family_name"] == query("family/family_name"))
    {
        command("say 虽然你为我门下弟子，可却非我嫡传"
                        "，还是去找你师父学吧。");
                return 1;
    }

    return 0;
}

void attempt_detach(object me)
{
        if (! me->is_apprentice_of(this_object()))
        {
                command("say 走开，我又不是你师傅，别来烦我。");
                return;
        }

        command("sigh");
        //转世后可以不损失武功脱离前世门派一次 by 薪有所属
        if (! me->query("old_family_name") || (me->query("old_family_name") != me->query("family/family_name")))
        {
        command("say 既然如此，我也不便强留，你走吧！");
        command("say 不过走之前你得先把你学到的武功留下！");

        message_vision(HIY "\n$N" HIY "一声大喝，陡然一指正点"
                       "在$n" HIY "的檀中大穴上。\n\n" NOR +
                       CYN "$N" CYN "说道：你的武功我已给你废"
                       "掉，今后你我再无师徒之份。\n"
                       NOR, this_object(), me);

        me->skill_expell_penalty();
        me->unconcious();
      }
        command("say 走吧走吧！走了就不要再回来！");
        me->add("detach/" + me->query("family/family_name"), 1);
        me->delete("family");
        me->set("gongxian", 0);
        me->delete("quest");
        me->delete_temp("quest");
        me->set("title", "普通百姓");
}

