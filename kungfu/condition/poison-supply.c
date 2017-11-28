// drunk.c

inherit F_CLEAN_UP;

int dispel() { return 0; }

int update_condition(object me, int parameter)
{
        mapping p;

        p = me->query("snake_poison");
        if (! p) return 0;

        p["remain"] = (int)p["remain"] + (int)p["supply"];
        if ((int)p["remain"] > (int)p["maximum"])
        {
                p["remain"] = (int)p["maximum"];
                return 0;
        }

	return 1;
}
