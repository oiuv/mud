// dodogbook.c

inherit ITEM;

void create()
{
        set_name("轻功篇", ({ "dodgebook", "shu", "book" }));
        set_weight(100);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
                        "轻功篇\n"
                        "这是一本还施水阁的轻功藏本，书色泛黄，有不少的批注。\n");
                set("value", 500);
                set("material", "paper");
                set("skill", ([
                        "name": "dodge",        // name of the skill
                        "exp_required": 10000,  // minimum combat experience required
                        "jing_cost":    1,      // jing cost every time study this
                        "difficulty":   20,     // the base int to learn this skill
                        "max_skill":    100     // the maximum level you can learn
                ]) );
        }
}
