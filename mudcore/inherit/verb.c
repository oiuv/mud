private nosave string Verb, ErrorMessage;
private nosave string *Synonyms, *Rules;

protected void create()
{
    parse_init();
    Verb = 0;
    ErrorMessage = 0;
    Rules = ({});
    Synonyms = ({});
}

protected string setErrorMessage(string str) { return (ErrorMessage = str); }

string getErrorMessage() { return ErrorMessage; }

varargs protected string *setRules(mixed *args...)
{
    if (sizeof(Rules))
        error("Cannot reset rules list.");
    foreach (mixed arg in args)
    {
        if (stringp(arg))
            Rules += ({arg});
        else
            Rules += arg;
    }
    if (Verb)
    {
        foreach (string rule in Rules)
            parse_add_rule(Verb, rule);
        if (sizeof(Synonyms))
            foreach (string cmd in Synonyms)
                parse_add_synonym(cmd, Verb);
    }
    return Rules;
}

string *getRules() { return copy(Rules); }

varargs protected string *setSynonyms(mixed *args...)
{
    if (sizeof(Synonyms))
        error("Cannot reset synonym list.\n");
    foreach (mixed arg in args)
    {
        if (stringp(arg))
            Synonyms += ({arg});
        else
            Synonyms += arg;
    }
    if (Verb && sizeof(Rules))
        foreach (string cmd in Synonyms)
            parse_add_synonym(cmd, Verb);
    return Synonyms;
}

string *getSynonyms() { return copy(Synonyms); }

protected string setVerb(string str)
{
    if (!stringp(str))
        error("Bad argument 1 to setVerb().\n");
    Verb = str;
    if (sizeof(Rules))
        foreach (string rule in Rules)
            parse_add_rule(Verb, rule);
    if (sizeof(Synonyms))
        foreach (string cmd in Synonyms)
            parse_add_synonym(cmd, Verb);
    return Verb;
}

string getVerb() { return Verb; }

string *getVerbs() { return ({Verb}); }
