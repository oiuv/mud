// daodejing-ii.c

inherit ITEM;

void create()
{
        set_name( "道德经「下卷」", ({ "jing", "daode jing" }));
        set_weight(200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一册道德经「下卷」，由同异第四十一始至显质第八十一止。\n");
                set("value", 500);
                set("material", "paper");
                set("skill", ([
                        "name": "taoism",       // name of the skill
                        "exp_required": 0,      // minimum combat experience required
                        "jing_cost": 20+random(20),     // jing cost every time study this
                        "difficulty":   25,     // the base int to learn this skill
                        "max_skill":    100,    // the maximum level you can learn
                ]) );
        }
}
