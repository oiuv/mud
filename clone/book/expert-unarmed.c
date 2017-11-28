// expert_unarmed.c

inherit BOOK;

void create()
{
        set_name("拳脚秘要", ({ "unarmed book", "book" }));
        set_weight(600);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
"封面上写著「拳脚秘要」\n");
                set("value", 50000);
                set("material", "paper");
                set("skill", ([
                        "name":         "unarmed",
                        "exp_required": 1000,
                        "jing_cost":    50,
                        "difficulty":   30,
                        "max_skill":    99,
                        "min_skill":    50,
                ]));
        }
}

