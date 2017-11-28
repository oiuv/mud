// jiuyin1.c

inherit BOOK;
inherit F_UNIQUE;
 
void create()
{
        set_name("「九阴真经」上册", ({ "jiuyin zhenjing1", "zhenjing1", }));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
        "这是一本用薄绢写成的书。上书：“九阴真经(上)”。\n"
        "书皮泛黄，看来已经保存很久了。\n", );
                set("value", 0);
                set("material", "silk");
                set("skill", ([
                        "name":       "force",
                        "exp_required": 100000,
                        "jing_cost" :  40,
                        "difficulty": 30,
                        "max_skill" :  199,
                        "min_skill" :  100
                ]) );
        }
}
