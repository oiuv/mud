// expert_dodge.c

inherit BOOK;

void create()
{
        set_name("轻功秘要", ({ "dodge book", "book" }));
        set_weight(600);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
"封面上写著「轻功秘要」\n");
                set("value", 50000);
                set("material", "paper");
                set("skill", ([
                        "name":         "dodge",
                        "exp_required": 1000,
                        "jing_cost":    50,
                        "difficulty":   30,
                        "max_skill":    99,
                        "min_skill":    50,
                ]));
        }
}

