// jiyin3.c

inherit BOOK;
inherit F_UNIQUE;
 
void create()
{
        set_name("「九阴真经」残本", ({ "jiuyin zhenjing3" }));
        set_weight(400);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long", "这是一本手抄本，上面记录了一些武功秘诀。\n");
                set("value", 0);
                set("material", "paper");
                set("skill", ([
                        "name":        "force",
                        "exp_required": 100000,
                        "jing_cost" : 45,
                        "difficulty": 30,
                        "max_skill" : 149,
                        "min_skill" : 100
                ]) );
        }
}
