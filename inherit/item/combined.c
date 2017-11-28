// combined_item.c

#include <dbase.h>
#include <name.h>

inherit F_CLEAN_UP;
inherit F_DBASE;
inherit F_MOVE;
inherit F_NAME;

STATIC_VAR_TAG int amount;

void setup()
{
        if (! query("unit"))
                set("unit", "Щ");
}

int query_amount() { return amount; }

void destruct_me() { destruct(this_object()); }

void set_amount(int v)
{
        if (v < 0) error("combine:set_amount less than 1.\n");
        if (v == 0)
        {
                amount = 0;
                call_out("destruct_me", 0);
        } else
        {
                amount = v;
                this_object()->set_weight(v * (int)query("base_weight"));
                if (! query("money_id"))
                        set("value", v * (int)query("base_value"));
        }
}

void add_amount(int v) { set_amount(amount + v); }

string short()
{
        return chinese_number(query_amount()) + query("base_unit")
                + ::short();
}

varargs int move(mixed dest, int silent)
{
        object env, *inv;
        int i, total;
        string file;

        if (::move(dest, silent))
        {
                env = environment();
                if (objectp(env))
                {
                        file = base_name(this_object());
                        inv = all_inventory(env);
                        total = (int)query_amount();
                        for (i = 0; i < sizeof(inv); i++)
                        {
                                if (inv[i] == this_object()) continue;
                                if (base_name(inv[i]) == file)
                                {
                                        total += (int)inv[i]->query_amount();
                                        destruct(inv[i]);
                                }
                        }
                        set_amount(total);
                }
                return 1;
        }
}

// does I can combine to an item in the object env ?
int can_combine_to(object env)
{
        object item;
        string file;

        file = base_name(this_object());
        foreach (item in all_inventory(env))
                if (base_name(item) == file)
                        return 1;

        return 0;
}
