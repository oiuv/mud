// yijinjing.c

#include <ansi.h>

inherit BOOK;

string book_name();
int need_level();
int need_exp();

void create()
{
        set_name(YEL "易筋经" NOR, ({ "yijin jing", "jing", "book" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "卷");
                set("long", "这是一卷古朴丝织经轴，看来很有年月了，上面文字古怪，不知你识
也不识。\n");
                set("value", 10);
                set("material", "silk");
                set("skill", ([
                        "name":         (: book_name :),// name of the skill
                        "exp_required": (: need_exp :), // minimum combat experience required
                        "jing_cost":    100,            // jing cost every time study this
                        "difficulty":   50,             // the base int to learn this skill
                        "max_skill":    180,            // the maximum level you can learn
                        "need" : ([ "sanscrit" : (: need_level :) ]),// need at least 200 lvl san
                ]) );
        }
}

string book_name()
{
        object me;

        me = this_player();
        if (me->query_skill("freezing-force", 1))
                return "freezing-force";

        return "yijinjing";
}

int need_level()
{
        object me;

        me = this_player();
        if (me->query_skill("freezing-force", 1))
                return 0;

        return 200;
}

int need_exp()
{
        object me;

        me = this_player();
        if (me->query_skill("freezing-force", 1))
                return 200000;

        return 1000000;
}

