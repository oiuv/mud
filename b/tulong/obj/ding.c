#include <ansi.h>
inherit ITEM;

#define TULONG    "/clone/lonely/tulongdao"

void create()
{
        object ob;
        set_name(NOR + YEL "Í­¶¦" NOR, ({ "ding" }));
        set("long", HIR "\nÖ»¼ûÍ­¶¦ÖÐÉÕ×ÅÐÜÐÜÁÒ»ð£¬»ðÑæ³åÆðÒ»ÕÉÀ´¸ß¡£\n" NOR);
        set_weight(5000000);
        set_max_encumbrance(800000);

        set("unit", "×ù");
        set("no_get", 1);
        if (clonep())
        {
                set_default_object(__FILE__);
                ob = find_object(TULONG);

                if (! ob)
			ob = load_object(TULONG);

                if (! environment(ob))
			ob->move(this_object());
        }
}
