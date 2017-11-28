// advance_blade.c

inherit BOOK;

void create()
{
        set_name("刀法详解", ({ "blade book", "book" }));
        set_weight(600);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "本");
                set("long",
"封面上写著「刀法详解」\n");
                set("value", 10000);
                set("material", "paper");
                set("skill", ([
                        "name":         "blade",
                        "exp_required": 1000,
                        "jing_cost":    30,
                        "difficulty":   25,
                        "max_skill":    49,
                        "min_skill":    20,
                ]));
        }
}

